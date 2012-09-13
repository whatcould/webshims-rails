require "webshims-rails/version"

module Webshims
  module Rails
    class Engine < ::Rails::Engine
      # Everything in the webshims directory should be precompiled, since
      # it all needs to be accessed dynamically depending on the browser
      initializer :append_webshims_assets_path, :group => :all do |app|
        app.config.assets.precompile << /webshims\/minified/ 
      end
    end
  end
end
