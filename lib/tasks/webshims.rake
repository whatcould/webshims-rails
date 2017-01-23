require 'fileutils'

desc 'Add a nondigest copy of assets so dynamic features will work.'
task 'webshims:update_public' do
  fingerprint = /\-[0-9a-f]{32,64}\./
  path        = File.join Rails.root.to_s, 'public', 'assets', 'webshims', '**/*'
  files       = Dir[path]

  files.each do |file|
    next unless file =~ fingerprint
    nondigest = file.sub fingerprint, '.'

    if !File.exist?(nondigest) || File.mtime(file) > File.mtime(nondigest)
      FileUtils.cp file, nondigest, verbose: true, preserve: true
    end
  end

  puts 'Added nondigest files in /public/assets/webshims'
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

if Rake::Task.task_defined?('assets:precompile')
  Rake::Task['assets:precompile'].enhance do
    Rake::Task['webshims:update_public'].invoke if defined?(Webshims)
  end
end
