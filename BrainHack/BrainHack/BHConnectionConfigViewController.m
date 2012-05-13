//
//  BHConnectionConfigViewController.m
//  BrainHack
//
//  Created by Steven Oxley on 5/12/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "BHConnectionConfigViewController.h"
#import "BHViewController.h"

@interface BHConnectionConfigViewController ()

@end

@implementation BHConnectionConfigViewController

@synthesize parent = _parent;
@synthesize ipAddressField = _ipAddressField;
@synthesize portField = _portField;
@synthesize popoverController;
@synthesize webPortField = _webPortField;

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
}

- (void)viewDidUnload
{
    [self setIpAddressField:nil];
    [self setPortField:nil];
    [self setWebPortField:nil];
    [super viewDidUnload];
    // Release any retained subviews of the main view.
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    return (interfaceOrientation == UIInterfaceOrientationPortrait);
}

- (void)viewDidDisappear:(BOOL)animated
{
    [self.parent setIpAddress:self.ipAddressField.text];
    [self.parent setPort:[self.portField.text intValue]];
    [self.parent setWebPort:[self.webPortField.text intValue]];
}

- (IBAction)connect:(id)sender {
    [self.popoverController dismissPopoverAnimated:YES];
    [self.parent setIpAddress:self.ipAddressField.text];
    [self.parent setPort:[self.portField.text intValue]];
    [self.parent setWebPort:[self.webPortField.text intValue]];
    [self.parent startClient];
}
@end
