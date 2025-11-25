#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <AVFoundation/AVFoundation.h>

@interface VoicePCMStreamer : RCTEventEmitter <RCTBridgeModule>

@property (nonatomic, strong) AVAudioEngine *audioEngine;

@end
