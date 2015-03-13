Rails.application.routes.draw do
  mount Webshims::Rails::Rewrite.new, :at => "/webshims/shims"
end
