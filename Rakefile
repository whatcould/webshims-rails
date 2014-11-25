require "bundler/gem_tasks"

desc "Update the source from the webshim github [Specify REF and VERSION]."
task :update do
  if ! ENV['REF']
    raise "No REF value given. Set branch/tag/id, e.g., REF=1.2.2"
  end
  if ! ENV['VERSION']
    raise "No VERSION value given. Set version, e.g., VERSION=1.2.2"
  end
  ref = ENV['REF']
  version = ENV['VERSION']

  cmd = <<EOT
  mkdir tmp
  cd tmp
  rm -rf webshim
  git clone https://github.com/aFarkas/webshim.git
  cd webshim
  git checkout #{ref}
  cd ../..
  rm -rf vendor/assets/javascripts/webshims
  mv tmp/webshim/src vendor/assets/javascripts/webshims
EOT
  system cmd

  version_rb = <<EOT
module Webshims
  module Rails
    VERSION = "***"
    WEBSHIMS_VERSION = "***"
  end
end
EOT

  version_rb.gsub!('***', version)
  File.open('lib/webshims-rails/version.rb','w') do |f|
    f.write version_rb
  end


  puts "Ok, check your work. If you are the gem owner, run rake push VERSION=#{version} to generate and push the gem."
  input = STDIN.gets.strip
end

desc "Commit changes, build and push the gem."
task :push do
    if ! ENV['VERSION']
      raise "No VERSION value given. Set version, e.g., VERSION=1.2.2"
    end
    version = ENV['VERSION']

  cmd = <<EOT
  git add -A .
  git commit -m "Update webshims to #{version}"
  gem build webshims-rails.gemspec
  gem push webshims-rails-#{version}.gem
EOT
  system cmd

end
