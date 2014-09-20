#!/usr/bin/env python


import os
from os.path import basename
import subprocess
import sys
import shutil

from glob import glob

def convert_file(path):
	base = basename(path)
	print(base)
	subprocess.check_call(["convert", path, os.path.splitext(base)[0]+".png"])
	if not os.path.exists("converted"):
		os.mkdir("converted")

	shutil.copy(path, os.path.join(os.path.dirname(path), "converted", base))

	os.remove(path)

	print(path)


files_dir = sys.argv[1]

if not os.path.exists(files_dir):
	exit()

os.chdir(os.path.dirname(files_dir))
file_list = glob("*.png")

for path in file_list:
	convert_file(path)