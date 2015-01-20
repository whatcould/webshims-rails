require "webshims-rails/version"

module Webshims
  module Rails
    class Engine < ::Rails::Engine
      # Everything in the webshims directory should be precompiled, since
      # it all needs to be accessed dynamically depending on the browser.
      # Turning this off by default for Rails 4, since in that case, users
      # are already using a workaround and likely do not need to precompile.
      unless ::Rails::VERSION::MAJOR >= 4
        initializer :append_webshims_assets_path, :group => :all do |app|
          app.config.assets.precompile << /webshims/
        end
      end
    end
  end
end
