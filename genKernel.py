#!/usr/bin/env python



import random


def lerp(min, max, v):
	return (v - min) / (max - min)

kernel = []
kernelSize = 16
for x in range(0, 16):
	a, b, c = random.uniform(-0.5, 0.5), random.uniform(0, 1), random.uniform(-0.5, 0.5)
	l = a * a + b * b + c * c;
	a /= l
	b /= l
	c /= l

	scale = x / 16
	scale = (0.1, 1.0, scale * scale)
	a *= scale
	b *= scale
	c *= scale

	print("vec3(", a, ", ", b, ",", c "),")