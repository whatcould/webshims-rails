module Webshims
  module Rails
    module ViewHelpers
      def webshims_path
        "/webshims/shims/#{Webshims::Rails::WEBSHIMS_VERSION}/"
      end
    end
  end
end
