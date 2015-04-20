2015-04-20
-------------------
* Added minified version of webshims library to lib/assets; updated the rake task `rake webshims:update_public` to copy the minified versions over to /public, since these files are not precompiled.

2015-01-19
-------------------
* Stopped adding webshims to the default assets-precompile list for Rails 4. This should only affect current Rails 4 users who are working around digest-only precompiling; they will need to add `config.assets.precompile << /webshims/` to their application.rb.

2015-01-04
-------------------
* Removed modernizr-custom from documentation, since webshims has removed its custom modernizr build. If your app depends on Modernizr, you'll have to build and include your own version.
