# caddy-music

Add a music player to the browse directive of caddy.

It use the HTML5 player of the browser and a simple script to 
play files one after another.

## Usage

Put the files wherever you want.
Serve the script under /static, use browse and specify the new template.

Exemple:

```Caddyfile
:80 {
        root music
        browse / static/caddy-music/tmpl.html
}

:80/static {
        root static/caddy-music
}
```

## Disclaimer

The javascript code was originaly created by someone for lolicore.org.
I reused the code and only slightly modify it to make it works with caddy browse.
All credits goes to him.

You can reach the guy on #qa @ irc.lolicore.org

## TODO

Implement the random play.