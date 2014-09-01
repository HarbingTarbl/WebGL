#!/usr/local/bin/python3

import json
import itertools;
import struct;

mesh = json.load(open("meshData.js"))

vertexCount = int(len(mesh["position"]) / 3)
positions = zip(mesh["position"][::3], mesh["position"][1::3], mesh["position"][2::3])
normals = zip(mesh["normal"][::3], mesh["normal"][1::3], mesh["normal"][2::3])
texCoords = zip(mesh["texCoord"][0][::2], mesh["texCoord"][0][1::2])


vertices = zip(positions, normals, texCoords)

outputFile = open('meshData.modeldata', 'wb')

for position, normal, texCoord in vertices:
	outputFile.write(struct.pack('8f', *itertools.chain(position, normal, texCoord)))




model = {
	"VertexOffset": 0,
	"VertexSize": 8,
	"VertexCount": vertexCount,
	"IndexSize": 2,
	"IndexCount": len(mesh["index"]),
	"IndexOffset": outputFile.tell(),
	"Attributes":{
		"Position":{
			"Index":0,
			"Size":3,
			"Offset":0,
		},
		"Normal":{
			"Index":1,
			"Size":3,
			"Offset":12,
		},
		"UV0":{
			"Index":2,
			"Size":2,
			"Offset":24
		}
	},
	"Data":"meshData.modeldata",
	"Materials":{
		"DefaultMaterial":{
			"DiffuseColor":[1,1,1],
			"SpecularColor":[1,1,1],
			"Roughness":5,
		}
	},
	"Meshes":[
		{
			"IndexOffset":0,
			"IndexCount":len(mesh["index"]),
			"Material":"DefaultMaterial"
		}
	],
	"Objects":{
		"Mesh":{
			"Meshes":[0],
			"Transform":[
				1.0,
	            0.0,
	            0.0,
	            0.0,
	            0.0,
	            0.0,
	            1.0,
	            0.0,
	            0.0,
	            -1.0,
	            0.0,
	            0.0,
	            0.0,
	            0.0,
	            0.0,
	            1.0
        	]
		}
	},
	"Name":"Mesh"
}

model["Data"] = "meshData.modeldata"


print(outputFile.tell())

outputFile.write(struct.pack("{0}H".format(len(mesh["index"])), *mesh["index"]))
json.dump(model, open("meshData.model", 'w'), indent=4)
