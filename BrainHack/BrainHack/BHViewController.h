//
//  BHViewController.h
//  BrainHack
//
//  Created by Steven Oxley on 5/12/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import <UIKit/UIKit.h>

extern NSString *BHServerIPAddrKey;
extern NSString *BHServerPortKey;

@interface BHViewController : UIViewController

@property (nonatomic, strong) NSString *ipAddress;
@property (nonatomic) int32_t port;

- (void)startClient;

@end
