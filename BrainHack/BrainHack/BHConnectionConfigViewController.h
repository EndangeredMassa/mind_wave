//
//  BHConnectionConfigViewController.h
//  BrainHack
//
//  Created by Steven Oxley on 5/12/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import <UIKit/UIKit.h>

@class BHViewController;

@interface BHConnectionConfigViewController : UIViewController

@property (nonatomic, weak) BHViewController *parent;
@property (weak, nonatomic) IBOutlet UITextField *ipAddressField;
@property (weak, nonatomic) IBOutlet UITextField *portField;
@property (weak, nonatomic) UIPopoverController *popoverController;
@property (weak, nonatomic) IBOutlet UITextField *webPortField;

- (IBAction)connect:(id)sender;

@end
