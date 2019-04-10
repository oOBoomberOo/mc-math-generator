# Minecraft Math Expression Generator
This extension provide a way to generate long and confusing `/scoreboard players operation` in a much shorter way.

## Features
1) Generate `/scoreboard players operation` command from math expression such as `1+2*3`.  
Do note that currently this extension always read expression from left to right not the usual PEMDAS convention.  
![](https://media.giphy.com/media/8ZeZuDDCClGOBWakch/giphy.gif)  
You can also use minecraft selector in the expression, E.g. `@e[tag=foo] * 12`  
![](https://media.giphy.com/media/cQ7bpYQ9iyxaFBjGHq/giphy.gif)  

2) Additionals operator  
2.1) '^' : Exponential, generate multiple /scoreboard lines to simulate exponential operator.  
Syntax: `<selector>^<exponent>`  
Example: `@s^2`, `@r[tag=foo]^5`  
Restriction: exponent must be pure integer not selector.

## Configurations
You can change these config from Settings page.  
`mc-math.default_scoreboard_1`: first scoreboard objective when no scoreboard is provided.  
`mc-math.default_scoreboard_2`: second scoreboard objective when no scoreboard is provided.  
`mc-math.exponent_limit`: limit how big can exponent of `^` operator be.

## Installation
[VScode extension](https://marketplace.visualstudio.com/items?itemName=Boomber.mc-math-generator&ssr=false#overview)

## Planned Features
- PEMDAS convention
