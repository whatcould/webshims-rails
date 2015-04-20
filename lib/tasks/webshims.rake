require 'fileutils'

desc "Copy the webshims to public/webshims so dynamic features will work."
task "webshims:update_public" do
  shim_root = Webshims::Rails::Engine.root.join('lib', 'assets', 'javascripts', 'webshims')
  FileUtils.cp_r(shim_root, Rails.root.join('public'))

  puts "Updated webshims files in /public/webshims"
end


desc "Copy the webshims to public/webshims/[version] for cache-busting."
task "webshims:update_public_versioned" do
  shim_root = Webshims::Rails::Engine.root.join('lib', 'assets', 'javascripts', 'webshims')
  FileUtils.rm_rf(Rails.root.join('public', 'webshims'))
  FileUtils.mkdir(Rails.root.join('public', 'webshims'))
  FileUtils.cp_r(shim_root, Rails.root.join('public', 'webshims', Webshims::Rails::WEBSHIMS_VERSION))

  puts "Updated webshims files in /public/webshims/#{Webshims::Rails::WEBSHIMS_VERSION}/"
  puts "\nBe sure your webshims options are set as follows:"
  puts %Q{    $.webshims.setOptions('basePath', '/webshims/#{Webshims::Rails::WEBSHIMS_VERSION}/shims/')}
  puts "\nYou can use ERB to dynamically set this path; See README for more information."
end