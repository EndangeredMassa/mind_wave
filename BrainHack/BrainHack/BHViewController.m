//
//  BHViewController.m
//  BrainHack
//
//  Created by Steven Oxley on 5/12/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "BHViewController.h"
#import "BHConnectionConfigViewController.h"
#import <CoreMotion/CoreMotion.h>

NSString *BHServerIPAddrKey = @"BHServerIPAddrKey";
NSString *BHServerPortKey = @"BHServerPortKey";

@interface BHViewController ()

@end

@implementation BHViewController

@synthesize motionMgr = _motionMgr;

+ (void)initialize
{
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    [defaults registerDefaults:[NSDictionary dictionaryWithObjectsAndKeys:
                                @"127.0.0.1", BHServerIPAddrKey,
                                [NSNumber numberWithInt:8124], BHServerPortKey, nil]];
}

- (NSString *)ipAddress
{
    return [[NSUserDefaults standardUserDefaults] valueForKey:BHServerIPAddrKey];
}

- (void)setIpAddress:(NSString *)ipAddress
{
    [[NSUserDefaults standardUserDefaults] setValue:ipAddress forKey:BHServerIPAddrKey];
}

- (int32_t)port
{
    NSNumber *num = [[NSUserDefaults standardUserDefaults] valueForKey:BHServerPortKey];
    return num.intValue;
}

- (void)setPort:(int32_t)port
{
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    [defaults setValue:[NSNumber numberWithInt:port] forKey:BHServerPortKey];
}

- (void)viewDidLoad
{
    self.motionMgr = [[CMMotionManager alloc] init];
    if (self.motionMgr.deviceMotionAvailable) {
        self.motionMgr.deviceMotionUpdateInterval = 0.01666;
        [self.motionMgr startDeviceMotionUpdatesToQueue:[NSOperationQueue mainQueue] withHandler:
         ^(CMDeviceMotion *motion, NSError *err) {
             if (err) {
                 NSLog(@"Motion error: %@", err.localizedDescription);
                 return;
             }
             double adjustedYaw = -motion.attitude.pitch / M_PI_4;
             adjustedYaw = adjustedYaw > 1.0 ? 1.0 : adjustedYaw;
             adjustedYaw = adjustedYaw < -1.0 ? -1.0 : adjustedYaw;
             
             if (_outStream.streamStatus == NSStreamStatusOpen) {
#ifdef DEBUG
                 NSLog(@"Yaw val: %f", adjustedYaw);
#endif
                 NSString *yawString = [NSString stringWithFormat:@"%f;", adjustedYaw];
                 NSData *yawData = [yawString dataUsingEncoding:NSUTF8StringEncoding];
                 int result = [_outStream write:yawData.bytes maxLength:yawData.length];
                 if (result == -1) {
                     NSLog(@"Write failed: %@", _outStream.streamError.localizedDescription);
                 }
             }
         }];
    }
    [super viewDidLoad];
}

- (void)viewDidUnload
{
    [super viewDidUnload];
    // Release any retained subviews of the main view.
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    if (UIInterfaceOrientationIsLandscape(interfaceOrientation)) {
        return YES;
    }
    return NO;
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender
{
    UIStoryboardPopoverSegue *popoverSegue = (UIStoryboardPopoverSegue *)segue;
    BHConnectionConfigViewController *dest = segue.destinationViewController;
    dest.popoverController = popoverSegue.popoverController;
    dest.parent = self;
    dest.ipAddressField.text = self.ipAddress;
    dest.portField.text = [NSString stringWithFormat:@"%d", self.port];
}

- (void)startClient
{
    CFReadStreamRef readStream;
    CFWriteStreamRef writeStream;
    CFStreamCreatePairWithSocketToHost(
                                       kCFAllocatorDefault,
                                       (__bridge CFStringRef)self.ipAddress,
                                       self.port, &readStream, &writeStream);
    _outStream = (__bridge_transfer NSOutputStream *)writeStream;
    _inStream = (__bridge_transfer NSInputStream *)readStream;

    [_outStream open];
}

- (void)stopClient
{
    [_outStream close];
    [_inStream close];
}

@end
