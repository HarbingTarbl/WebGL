#!/usr/bin/env python

from random import random

kernel = []
kernelSize = 16
for x in range(0, 16):
	a, b, c = random(), random(), random()
	l = a * a + b * b + c * c;
	a /= l
	b /= l
	c /= l
	kernel[x] = [a, b, c]
	