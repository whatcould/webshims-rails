require "webshims-rails/version"
require "webshims-rails/view-helpers"
require "webshims-rails/rewrite"

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

      initializer "Webshims::Rails::ViewHelpers" do
        ActiveSupport.on_load(:action_view) { include Webshims::Rails::ViewHelpers }
      end
    end
  end
end
