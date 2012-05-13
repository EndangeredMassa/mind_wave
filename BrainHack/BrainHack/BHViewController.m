//
//  BHViewController.m
//  BrainHack
//
//  Created by Steven Oxley on 5/12/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "BHViewController.h"
#import "BHConnectionConfigViewController.h"

NSString *BHServerIPAddrKey = @"BHServerIPAddrKey";
NSString *BHServerPortKey = @"BHServerPortKey";

@interface BHViewController ()

@end

@implementation BHViewController

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
    [super viewDidLoad];
}

- (void)viewDidUnload
{
    [super viewDidUnload];
    // Release any retained subviews of the main view.
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    return YES;
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender
{
    UIStoryboardPopoverSegue *popoverSegue = (UIStoryboardPopoverSegue *)segue;
    BHConnectionConfigViewController *dest = segue.destinationViewController;
    dest.popoverController = popoverSegue.popoverController;
    dest.parent = self;
}

- (void)startClient
{
    CFReadStreamRef readStream;
    CFWriteStreamRef writeStream;
    CFStreamCreatePairWithSocketToHost(
                                       kCFAllocatorDefault,
                                       (__bridge CFStringRef)self.ipAddress,
                                       self.port, &readStream, &writeStream);
    NSOutputStream *outStream = (__bridge_transfer NSOutputStream *)writeStream;
    NSData *data = [@"Test" dataUsingEncoding:NSUTF8StringEncoding];
    [outStream open];
    int result = [outStream write:data.bytes maxLength:data.length];
    if (result != -1) {
        NSLog(@"Write successful.");
    }
    else {
        NSLog(@"Write failed: %@", outStream.streamError.localizedDescription);
    }
}

@end
