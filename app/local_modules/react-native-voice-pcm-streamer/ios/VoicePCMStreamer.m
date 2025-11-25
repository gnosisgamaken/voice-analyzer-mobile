#import "VoicePCMStreamer.h"
#import <React/RCTLog.h>

@implementation VoicePCMStreamer {
  bool hasListeners;
}

RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents {
  return @[@"onAudioPCM"];
}

- (void)startObserving {
  hasListeners = YES;
}

- (void)stopObserving {
  hasListeners = NO;
}

RCT_EXPORT_METHOD(startStreaming:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  RCTLogInfo(@"Starting audio streaming...");
  
  if (self.audioEngine == nil) {
    self.audioEngine = [[AVAudioEngine alloc] init];
  }
  
  AVAudioInputNode *inputNode = [self.audioEngine inputNode];
  AVAudioFormat *format = [inputNode inputFormatForBus:0];
  
  // Check if we can install tap
  [inputNode removeTapOnBus:0];
  
  // Install tap on the input node
  // Buffer size 1024 is a request, system might give different size
  [inputNode installTapOnBus:0 bufferSize:1024 format:format block:^(AVAudioPCMBuffer * _Nonnull buffer, AVAudioTime * _Nonnull when) {
    if (self->hasListeners) {
      // Convert buffer to array of floats
      float *frameData = buffer.floatChannelData[0]; // Mono or first channel
      int frameLength = buffer.frameLength;
      
      // Create a mutable data object to hold the bytes
      NSMutableData *data = [NSMutableData dataWithBytes:frameData length:frameLength * sizeof(float)];
      
      // Convert to Base64 string
      NSString *base64String = [data base64EncodedStringWithOptions:0];
      
      [self sendEventWithName:@"onAudioPCM" body:@{
        @"pcmData": base64String,
        @"sampleRate": @(format.sampleRate)
      }];
    }
  }];
  
  NSError *error = nil;
  if (![self.audioEngine startAndReturnError:&error]) {
    reject(@"start_failed", @"Failed to start audio engine", error);
    return;
  }
  
  resolve(@(YES));
}

RCT_EXPORT_METHOD(stopStreaming:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  RCTLogInfo(@"Stopping audio streaming...");
  
  if (self.audioEngine) {
    [self.audioEngine stop];
    [[self.audioEngine inputNode] removeTapOnBus:0];
    self.audioEngine = nil;
  }
  
  resolve(@(YES));
}

@end
