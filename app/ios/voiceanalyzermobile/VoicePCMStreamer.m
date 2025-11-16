#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface VoicePCMStreamer : RCTEventEmitter <RCTBridgeModule>
@end

@implementation VoicePCMStreamer {
  AVAudioEngine *_audioEngine;
  BOOL _isStreaming;
  double _sampleRate;
  AVAudioFrameCount _frameSize;
}

RCT_EXPORT_MODULE(VoicePCMStreamer);

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[ @"VoicePCMStreamer:onFrame" ];
}

- (void)invalidate
{
  [self cleanupAudioSession];
}

- (void)dealloc
{
  [self cleanupAudioSession];
}

- (void)cleanupAudioSession
{
  if (!_audioEngine) {
    _isStreaming = NO;
    return;
  }

  AVAudioInputNode *inputNode = _audioEngine.inputNode;
  if (inputNode) {
    [inputNode removeTapOnBus:0];
  }
  [_audioEngine stop];
  _audioEngine = nil;
  _isStreaming = NO;
}

- (void)handleBuffer:(AVAudioPCMBuffer *)buffer
{
  if (!_isStreaming || buffer.frameLength == 0) {
    return;
  }

  float *channelData = buffer.floatChannelData[0];
  if (!channelData) {
    return;
  }

  AVAudioFrameCount frameLength = buffer.frameLength;
  NSUInteger byteLength = frameLength * sizeof(int16_t);
  NSMutableData *pcmData = [NSMutableData dataWithLength:byteLength];
  if (!pcmData) {
    return;
  }

  int16_t *dest = (int16_t *)pcmData.mutableBytes;
  for (AVAudioFrameCount i = 0; i < frameLength; i++) {
    float sample = channelData[i];
    sample = fmaxf(fminf(sample, 1.0f), -1.0f);
    dest[i] = (int16_t)lrintf(sample * 32767.0f);
  }

  NSString *base64 = [pcmData base64EncodedStringWithOptions:0];
  if (!base64) {
    return;
  }

  [self sendEventWithName:@"VoicePCMStreamer:onFrame"
                     body:@{
                       @"chunk": base64,
                       @"sampleRate": @(_sampleRate),
                       @"frameSamples": @(frameLength)
                     }];
}

RCT_EXPORT_METHOD(startStreaming:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  if (_isStreaming) {
    resolve(@(YES));
    return;
  }

  double preferredRate = [options[@"sampleRate"] doubleValue];
  if (preferredRate <= 0) {
    preferredRate = 44100.0;
  }

  NSInteger frameSizeValue = [options[@"frameSize"] integerValue];
  if (frameSizeValue <= 0) {
    frameSizeValue = (NSInteger)lrint(preferredRate * 0.02);
  }

  dispatch_async(dispatch_get_main_queue(), ^{
    NSError *error = nil;
    AVAudioSession *session = [AVAudioSession sharedInstance];
    AVAudioSessionCategoryOptions options = AVAudioSessionCategoryOptionDefaultToSpeaker |
      AVAudioSessionCategoryOptionAllowBluetooth | AVAudioSessionCategoryOptionMixWithOthers;

    if (![session setCategory:AVAudioSessionCategoryPlayAndRecord
                  withOptions:options
                        error:&error]) {
      reject(@"pcm_stream_session", @"Failed to configure audio session", error);
      return;
    }

    if (![session setMode:AVAudioSessionModeMeasurement error:&error]) {
      reject(@"pcm_stream_mode", @"Failed to set audio session mode", error);
      return;
    }

    if (![session setPreferredSampleRate:preferredRate error:&error]) {
      reject(@"pcm_stream_rate", @"Failed to set preferred sample rate", error);
      return;
    }

    NSTimeInterval bufferDuration = (NSTimeInterval)frameSizeValue / preferredRate;
    if (![session setPreferredIOBufferDuration:bufferDuration error:&error]) {
      reject(@"pcm_stream_buffer_duration", @"Failed to set buffer duration", error);
      return;
    }

    _audioEngine = [[AVAudioEngine alloc] init];
    AVAudioInputNode *inputNode = _audioEngine.inputNode;
    if (!inputNode) {
      _audioEngine = nil;
      reject(@"pcm_stream_input", @"Microphone input node unavailable", nil);
      return;
    }

    AVAudioFormat *format = [[AVAudioFormat alloc] initStandardFormatWithSampleRate:preferredRate channels:1];
    if (!format) {
      _audioEngine = nil;
      reject(@"pcm_stream_format", @"Unable to create audio format", nil);
      return;
    }

    AVAudioFrameCount bufferSize = (AVAudioFrameCount)frameSizeValue;
    [inputNode removeTapOnBus:0];

    __weak typeof(self) weakSelf = self;
    [inputNode installTapOnBus:0
                     bufferSize:bufferSize
                         format:format
                          block:^(AVAudioPCMBuffer *buffer, AVAudioTime *when) {
                            [weakSelf handleBuffer:buffer];
                          }];

    [_audioEngine prepare];
    if (![_audioEngine startAndReturnError:&error]) {
      [inputNode removeTapOnBus:0];
      _audioEngine = nil;
      reject(@"pcm_stream_start", @"Unable to start AVAudioEngine", error);
      return;
    }

    _sampleRate = preferredRate;
    _frameSize = bufferSize;
    _isStreaming = YES;
    resolve(@(YES));
  });
}

RCT_EXPORT_METHOD(stopStreaming:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  if (!_isStreaming) {
    resolve(@(NO));
    return;
  }

  dispatch_async(dispatch_get_main_queue(), ^{
    [self cleanupAudioSession];
    resolve(@(YES));
  });
}

@end
