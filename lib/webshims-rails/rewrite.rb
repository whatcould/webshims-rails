module Webshims
  module Rails
    class Rewrite
      class << self
        def call(env)
          filename = path(env)
          body = File.read(filename)
          [
              200,
              {
                  "Content-Type" => content_type(filename),
                  "Content-Length" => bytesize(body)
              },
              [body]
          ]
        end

        private

        def path(env)
          filename = env["PATH_INFO"].gsub(%r(\A/[0-9.]+/), '')
          File.join(Gem.loaded_specs['webshims-rails'].full_gem_path, "vendor", "assets", "javascripts", "webshims", "shims", filename)
        end

        def content_type(filename)
          extname = File.extname(filename)[1..-1]
          mime_type = Mime::Type.lookup_by_extension(extname)
          mime_type.to_s
        end

        def bytesize(content)
          "".respond_to?(:bytesize) ? content.bytesize.to_s : content.size.to_s
        end
      end
    end
  end
end
