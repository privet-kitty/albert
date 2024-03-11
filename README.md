# Albert - simple training tool for colorimetry

[![CI Status](https://github.com/privet-kitty/albert/actions/workflows/ci-master.yml/badge.svg)](https://github.com/privet-kitty/albert/actions)

This is a simple training tool to guess the Munsell Color code of a given color.

https://privet-kitty.github.io/albert/

![screenshot](https://github.com/privet-kitty/albert/blob/master/screenshot.png)

## Mechanism

- It assumes that your monitor is calibrated to sRGB.
- The score of your guess is computed based on CIEDE2000.
- The backend of this tool is based on [munsell.js](https://github.com/privet-kitty/munsell.js), my library for handling Munsell Colors. Please see the link for details.

## Copyright

Copyright (c) 2018-2024 Hugo Sansaqua.
