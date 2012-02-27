# -*- encoding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)
require "webshims-rails/version"

Gem::Specification.new do |s|
  s.name        = "webshims-rails"
  s.version     = Webshims::Rails::VERSION
  s.authors     = ["David Reese"]
  s.email       = ["work@whatcould.com"]
  s.homepage    = "https://github.com/whatcould/webshims-rails"
  s.summary     = %q{Webshims lib packaged as a Rails engine}
  s.description = %q{Makes it simple to include the webshims js library (by Alexander Farkas) in the Rails asset pipeline.}

  s.rubyforge_project = "webshims-rails"

  s.files         = `git ls-files`.split("\n")
  s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  s.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  s.require_paths = ["lib"]

  # specify any dependencies here; for example:
  s.add_dependency "rails", "> 3.1.0"

  # s.add_development_dependency "rspec"
  # s.add_runtime_dependency "rest-client"
end
