Rails.application.routes.draw do
  if ::Rails::VERSION::MAJOR < 4
    mount Webshims::Rails::Rewrite.new, :at => "/assets/webshims/shims"
  else
    mount Webshims::Rails::Rewrite.new, :at => "/webshims/shims"
  end
end
