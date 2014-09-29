#!/usr/bin/env python3

import png
import math
import itertools
import random

class vertex:
	def __init__(self, x, y, z):
		self.x = x;
		self.y = y;
		self.z = z;

	def normalize(self):
		len = self.length();
		self.x /= len
		self.y /= len
		self.z /= len

	def length2(self):
		return (self.x * self.x) + (self.y * self.y) + (self.z * self.z)

	def length(self):
		return math.sqrt(self.length2())

	def mul(self, value):
		self.x *= value
		self.y *= value
		self.z *= value

	def add(self, value):
		self.x += value
		self.y += value
		self.z += value

size = 4
vertices = [vertex(random.uniform(-1, 1), random.uniform(-1, 1), 0) for x in range(0, size * size)]
for vert in vertices:
	vert.normalize()
	vert.mul(0.5)
	vert.add(0.5)
	vert.mul(255)

pixels = [(v.x, v.y, v.z) for v in vertices]
p = []
for x in range(0, size):
	p.append(list(itertools.chain.from_iterable(pixels[x * size:size + x * size])))

pixels = list(p)


png.from_array(pixels, 'RGB').save('noise.png')