#!/usr/bin/env python3



import random
import math


def lerp(min_v, max_v, v):
	return max(min((v - min_v) / (max_v - min_v), max_v), min_v)

kernel = []
kernelSize = 16



for x in range(0, 16):
	a, b, c = random.uniform(-1, 1), random.uniform(-1, 1), random.uniform(0.1, 1)
	l = a * a + b * b + c * c;
	l = math.sqrt(l)
	a /= l
	b /= l
	c /= l

	scale = x / 16
	scale = lerp(0.1, 1.0, scale * scale)
	a *= scale
	b *= scale
	c *= scale

	print("{0}, {1}, {2}".format(a,b,c), end=', ')
