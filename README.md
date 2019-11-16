# Wooly

:construction: An experimental Javascript 2D Game Engine. :construction:

[中文](README_cn.md)

---

## Summary

**Wooly** is a 2D game engine written in Typescript, based on Canvas API. The object tree model and coding style are largely inspired by [Godot][_godot].

It is rather simple, but still battery-included. Built-in functions including:

- Sprite
- Animation
- Collision Detact ([AABB][_aabb]/[SAT][_sat])
- Input Handling
- Audio Playback
- UI Framework
- Particals
- State Machine Model
- Scene / Scene Manager
- Diagnosis (FPS | Mouse Position Indicator)
- ~~Physical Simulation~~ (Never Happens)
- And other goodies...

Since the quality standard of **Wooly** is as lower as "enough to build my game upon", though it is possible, I don't suggest using it in a serious project. Consider it when:

- Doing quick prototyping
- Working on a not-that-serious project
- Seeking a handy framework for a game contest like [JS13k][_js13k]
  > But watch out for the package size, my friend.
- Take a peak of what a naive game engine looks like
- ~~Trying to write a Godot game in C# on Linux, but the coding experience is not pleasing at all~~

## Docs

Coming soon. Maybe.

## TODOs

- [ ] Comments on all public APIs
- [ ] Examples
- [ ] Detailed docs

## Trivia

The origin code was an in-game library of my contest project for [JS13k][_js13k] 2019. The game is never finished, but the library alone works quite well, IMO.

About the name, I was just thinking of a short and fluffy word, and yeah, that's it, **Wooly**.

## License

[MIT](LICENSE)

[_godot]: https://godotengine.org/
[_aabb]: https://en.wikipedia.org/wiki/Minimum_bounding_box#Axis-aligned_minimum_bounding_box
[_sat]: http://www.dyn4j.org/2010/01/sat/
[_js13k]: http://js13kgames.com/
