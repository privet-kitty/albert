# A Simple Training Tool for Colorimetry

[![CI Status](https://github.com/privet-kitty/albert/actions/workflows/ci-master.yml/badge.svg)](https://github.com/privet-kitty/albert/actions)

Albert is a simple training tool designed to help you guess the Munsell Color code of a given color.

Try it out here: https://privet-kitty.github.io/albert/

![screenshot](https://github.com/privet-kitty/albert/blob/master/screenshot.png)

## Mechanism

- The tool assumes your monitor is calibrated to the sRGB color space.
- Your guesses are scored using the CIEDE2000 color difference formula.
- Albert is powered by [munsell.js](https://github.com/privet-kitty/munsell.js), my library for working with Munsell Colors. For more information, check out the repository.

## Copyright

Copyright (c) 2018-2025 Hugo Sansaqua.
