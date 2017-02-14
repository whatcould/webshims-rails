module Webshims
  module Rails
    class Rewrite < Rack::File

      def initialize
        super(root)
      end

      def call(env)
        env["PATH_INFO"] = env["PATH_INFO"].gsub(%r(\A/[0-9.]+/), '')
        super(env)
      end

      private

      def root
        File.join(Gem.loaded_specs["webshims-rails"].full_gem_path, "vendor", "assets", "javascripts", "webshims", "shims")
      end
    end
  end
end
