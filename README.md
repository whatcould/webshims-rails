# Webshims-rails

Easily include the [webshims library](http://aFarkas.github.com/webshim/demos/index.html) (by Alexander Farkas) in your Rails 3.1+ project with the asset pipeline.

## Note on Changes in Rails 4

With the release of Rails 4 and an updated [sprockets-rails](https://github.com/rails/sprockets-rails#changes-from-rails-3x gem), only digest filenames are compiled when running rake assets:precompile (non-digest filenames are no longer compiled).

Since webshims does not support fingerprinting, this will result in 404s (missing assets) in production mode, since webshims dynamically chooses shim javascript files to request depending on the browser. To avoid this, you have three options:

1a. **Recommended**: Versioned-copy to /public. Run this rake task every time you update webshims:

  ```bash
  rake webshims:update_public_versioned
  ```

  This copies the webshims files (minified versions) into your Rails public/ directory, at `public/webshims/[webshims.verison]`. Scoping the webshims files to the webshims path will prevent browsers from caching old webshims code.

  Then, alter step 3 below to re-configure your basePath from public/assets (as it was in Rails 3.X) to public/:

  ```javascript
  $.webshims.setOptions('basePath', '/webshims/[webshims-version]/shims/')
  ```

  You can add an .erb extention to your javascript file and have it set the webshims version path.

  ```javascript
  $.webshims.setOptions('basePath', '/webshims/<%= Webshims::Rails::WEBSHIMS_VERSION %>/shims/')
  ```


1B. [This is the older, simpler version of 1a.] Copy webshims to the /public directory. Run this rake task every time you update webshims:

  ```bash
  rake webshims:update_public
  ```

  This copies the webshims files (minified versions) into your Rails public/ directory, at `public/webshims`. Then, alter step 3 below to re-configure your basePath from public/assets (as it was in Rails 3.X) to public/:

  ```javascript
  $.webshims.setOptions('basePath', '/webshims/shims/')
  ```
2. Or, turn (back) on asset compiling with non-digest filenames, with, for example, this gist: https://gist.github.com/eric1234/5692456. Don't forget that, if you go this direction, you'll also have to add webshims to the assets that are precompiled by default: `config.assets.precompile << /webshims/` in application.rb.

3. Or, mount the webshims assets to your application. This bypasses the assests pipeline and exposes the internal copies of the assets from directly within webshims-rails.

  Mount the assets within ```routes.rb```

  ```
  Rails.application.routes.draw do
    mount Webshims::Rails::Engine.mountable_assets_directory => '/webshims'
    ...
  end
  ```

  Define the mounted path as the ```basePath``` for webshims.

  ```javascript
  $.webshims.setOptions('basePath', '/webshims/shims/')
  ```


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
