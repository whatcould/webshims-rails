module Webshims
  module Rails
    module ViewHelpers
      def webshims_path
        path = "/webshims/shims/#{Webshims::Rails::WEBSHIMS_VERSION}/"
        path = "/assets/#{path}" if ::Rails::VERSION::MAJOR < 4
        path
      end
    end
  end
end
