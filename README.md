# Webshims-rails

Easily include the "webshims library":http://aFarkas.github.com/webshim/demos/index.html (by Alexander Farkas) in your Rails 3.1+ project with the asset pipeline.

## Note on Changes in Rails 4

With the release of Rails 4 and an updated [sprockets-rails](https://github.com/rails/sprockets-rails#changes-from-rails-3x gem), only digest filenames are compiled when running rake assets:precompile (non-digest filenames are no longer compiled).

Since webshims does not support fingerprinting, this will result in 404s (missing assets) in production mode. To avoid this, you have two options:

1. Run this rake task every time you update webshims:

  ```bash
  rake webshims:update_public
  ```

  This copies the webshims directory into the public/ directory. Then, alter step 3 below to re-configure your basePath from public/assets (as it was in Rails 3.X) to public/:

  ```javascript
  $.webshims.setOptions('basePath', '/webshims/shims/')
  ```
2. Or, turn (back) on asset compiling with non-digest filenames, with, for example, this gist: https://gist.github.com/eric1234/5692456. Don't forget that, if you go this direction, you'll also have to add webshims to the assets that are precompiled by default: `config.assets.precompile << /webshims/` in application.rb.


## Usage

1. Add webshims-rails to your Gemfile for bundler: `gem 'webshims-rails'`
2. Require the webshims polyfiller, eg, in your application.js:

  ```javascript
  //= require webshims/polyfiller
  ```

  *Update note:* Previous webshims versions included a custom modernizr build; this was removed in webshims 1.14.6, so the (previously necessary) `require webshims/extras/modernizr-custom` line should be removed, and if your app requires modernizr, you'll have to build and require it yourself.

3. In your javascript, after the polyfiller has been required, set the basePath for webshims as shown below, and then call $.webshims.polyfill(); see webshims docs for more options.
   (Note that this should be run directly, not in a dom-ready block.)

  ```javascript
  $.webshims.setOptions('basePath', '/assets/webshims/shims/')
  $.webshims.polyfill()
  ```

4. For Turbolinks users only: you'll need to update the polyfill on page load:

  ```coffeescript
  $(document).on "page:load", ->
    $(this).updatePolyfill()
  ```

## Updating this gem

This is only in the case this repository is not up-to-date; I try to stay current with webshims but sometimes I miss the webshims releases.

There's a quick-and-dirty rake task in the repository to checkout webshims from github, checkout a git ref, and copy the required scripts over. You need to specify the Webshims-rails version and the git reference (version/tag/sha) from the webshims repository.

```bash
rake update VERSION=1.14.5 REF=1.14.5
```

## License

MIT licensed, like the Webshims library.
