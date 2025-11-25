require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-voice-pcm-streamer"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = "https://github.com/gnosisgamaken/voice-analyzer-mobile"
  s.license      = "MIT"
  s.authors      = { "Antigravity" => "antigravity@example.com" }
  s.platforms    = { :ios => "11.0" }
  s.source       = { :git => "https://github.com/gnosisgamaken/voice-analyzer-mobile.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"

  s.dependency "React-Core"
end
