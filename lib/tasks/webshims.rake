require 'fileutils'

desc "Copy the webshims to public/webshims so dynamic features will work."
task "webshims:update_public" do
  shim_root = Webshims::Rails::Engine.root.join('vendor', 'assets', 'javascripts', 'webshims')
  FileUtils.cp_r(shim_root, Rails.root.join('public'))
end