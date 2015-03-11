Rails.application.routes.draw do
  if ::Rails::VERSION::MAJOR < 4
    mount Webshims::Rails::Rewrite, :at => "/assets/webshims/shims"
  else
    mount Webshims::Rails::Rewrite, :at => "/webshims/shims"
  end
end
