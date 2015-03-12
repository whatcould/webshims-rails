module Webshims
  module Rails
    class Rewrite < Rack::File

      def initialize
        env[PATH_INFO] = env[PATH_INFO].gsub(%r(\A/[0-9.]+/), '')
        super(root)
      end

      private

      def root
        File.join(Gem.loaded_specs['webshims-rails'].full_gem_path, "vendor", "assets", "javascripts", "webshims", "shims")
      end
    end
  end
end
