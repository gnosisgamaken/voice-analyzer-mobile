#import "VoicePCMStreamer.h"

@implementation VoicePCMStreamer {
    AVAudioEngine *_audioEngine;
    BOOL _isStreaming;
}

RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents {
    return @[@"onAudioPCM"];
}

RCT_EXPORT_METHOD(startStreaming) {
    if (_isStreaming) return;

    _audioEngine = [[AVAudioEngine alloc] init];
    AVAudioInputNode *inputNode = _audioEngine.inputNode;
    
    // Format: 44.1kHz, Mono, Float32
    AVAudioFormat *format = [[AVAudioFormat alloc] initWithCommonFormat:AVAudioPCMFormatFloat32
                                                             sampleRate:44100
                                                               channels:1
                                                            interleaved:NO];
    
    // Install tap on input node
    // Buffer size 256 frames (~5.8ms latency)
    [inputNode installTapOnBus:0 bufferSize:256 format:format block:^(AVAudioPCMBuffer * _Nonnull buffer, AVAudioTime * _Nonnull when) {
        if (!self->_isStreaming) return;
        
        // Convert buffer to base64
        float *frameData = buffer.floatChannelData[0];
        NSData *data = [NSData dataWithBytes:frameData length:buffer.frameLength * sizeof(float)];
        NSString *base64String = [data base64EncodedStringWithOptions:0];
        
        [self sendEventWithName:@"onAudioPCM" body:@{
            @"pcmData": base64String,
            @"sampleRate": @(format.sampleRate)
        }];
    }];
    
    NSError *error = nil;
    [_audioEngine startAndReturnError:&error];
    
    if (error) {
        NSLog(@"[VoicePCMStreamer] Error starting engine: %@", error.localizedDescription);
        return;
    }
    
    _isStreaming = YES;
}

RCT_EXPORT_METHOD(stopStreaming) {
    if (!_isStreaming) return;
    
    [_audioEngine.inputNode removeTapOnBus:0];
    [_audioEngine stop];
    _audioEngine = nil;
    _isStreaming = NO;
}

@end
