#!/usr/local/bin/python3

import png
import sys
import argparse
import json
import itertools
import math
import functools
import array
from PIL import Image


parser = argparse.ArgumentParser(description="create a diffuse convolution of a cubemap")
parser.add_argument("input", type=open)
parser.add_argument("output")


args = parser.parse_args()

def dot(a, b):
	def _dot(a):
		return functools.reduce(lambda x, y: x * y, a)
	chain = zip(a, b)
	return functools.reduce(lambda x, y: x + y, map(_dot, chain))

def length2(a):
	return dot(a,a)

def length(a):
	return math.sqrt(length2(a))

def normalize(a):
	l = length(a)
	return list(map(lambda x: x, a))

def add(a, b):
	return list(map(lambda x: x[0] + x[1], zip(a, b)))

def sub(a, b):
	return list(map(lambda x: x[0] - x[1], zip(a, b)))

def mul(a, b):
	return list(map(lambda x: x * b, a))

def getLambert(normal, source, dest):
	dir = normalize(sub(dest, source))
	return max(dot(dir, normal), 0.0)

class Face:
	def __init__(self, normal, image):
		self.normal = normalize(normal)
		self.image = image

class CubeMap:
	def __init__(self, faces):
		self.faces = faces


def get3DLocation(pixelPos, normal):
	x, y = pixelPos
	if(abs(normal[0])):
		return (-normal[0], x, y)
	elif(abs(normal[1])):
		return (x, -normal[1], y)
	elif(abs(normal[2])):
		return (x, y, -normal[2])
	else:
		assert("Bad Normal")

def convolvePixelForFace(pixelNormal, pixelPos, face):
	color = [0,0,0]

	width = face.image.size[0]
	height = face.image.size[1]
	pos3d = get3DLocation(pixelPos, pixelNormal)
	for x in range(width):
		for y in range(height):
			facepos = get3DLocation((x,y), face.normal)
			pixdot = dot(pixelNormal, normalize(sub(pos3d, facepos)))
			color = add(color, mul(face.image.getpixel((x,y)), pixdot))

	print(color)
	return mul(color, 1.0 / (width * height))

def convolveFace(face, faces):
	pixels = list(list([0,0,0] for x in range(face.image.size[0])) for y in range(face.image.size[1]))
	for destFace in (x for x in faces if x is not face):
		width = face.image.size[0]
		height = face.image.size[1]
		for x, y in itertools.product(range(width), range(height)):
			r = convolvePixelForFace(face.normal, (x,y), destFace)
			print(r)
			print(pixels[x][y]) 
			pixels[x][y] = add(pixels[x][y],r)

	pixBytes = array.array('f')
	for col in pixels:
		for row in col:
			for pix in row:
				pixBytes.append(pix)

	image = Image.frombytes('RGB', face.image.size, pixBytes.tobytes())

	return Face(face.normal, image)


def diffuseConvolve(input, output):
	js = json.load(input)
	faces = map(lambda x: (js[x[0]], x[1]), [
		("+x", [1,0,0]), 
		("+y", [0,1,0]), 
		("+z",[0,0,1]), 
		("-x",[-1,0,0]), 
		("-y", [0,-1,0]),
		("-z", [0,0,-1])])

	faces = map(lambda x: Face(x[1], Image.open(x[0])), faces)
	faces = map(lambda x: convolveFace(x, faces), faces)
	def getName(normal):
		if normal[0] == 1:
			return "+x"
		elif normal[0] == -1:
			return "-x"
		elif normal[1] == 1:
			return "+y"
		elif normal[1] == -1:
			return "-y"
		elif normal[2] == 1:
			return "+z"
		elif normal[2] == -1:
			return "-z"
		else:
			return "Ohgodwhathappened"

	faces = list(faces)
	print(faces)
	for face in faces:
		face.image.save("diffuse_{0}.png".format(getName(face.normal)))



output = open(args.output, 'w')
diffuseConvolve(args.input, output)

