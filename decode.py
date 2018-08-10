import RPi.GPIO as GPIO
import math
import os
from datetime import datetime
from time import sleep

# This is for revision 1 of the Raspberry Pi, Model B
# This pin is also referred to as GPIO23
INPUT_WIRE = 16

SHORT = 600
MEDIUM = 1500
LONG = 24000
LONGEST = 30000

GPIO.setmode(GPIO.BOARD)
GPIO.setup(INPUT_WIRE, GPIO.IN)

while True:
	value = 1
	# Loop until we read a 0
	while value:
		value = GPIO.input(INPUT_WIRE)

	# Grab the start time of the command
	startTime = datetime.now()

	# Used to buffer the command pulses
	command = []

	# The end of the "command" happens when we read more than
	# a certain number of 1s (1 is off for my IR receiver)
	numOnes = 0

	# Used to keep track of transitions from 1 to 0
	previousVal = 0

	while True:

		if value != previousVal:
			# The value has changed, so calculate the length of this run
			now = datetime.now()
			pulseLength = now - startTime
			startTime = now

			command.append((previousVal, pulseLength.microseconds))

		if value:
			numOnes = numOnes + 1
		else:
			numOnes = 0

		# 10000 is arbitrary, adjust as necessary
		if numOnes > 10000:
			break

		previousVal = value
		value = GPIO.input(INPUT_WIRE)
	
	print "----------Start----------"
	for (i, val) in enumerate(command):
		val_next = command[i+1]
		if val[0] == 0:
			if (val[1] < SHORT and val_next[1] < SHORT):
				print 0
			elif (val[1] < SHORT and val_next[1] > SHORT and val_next[1] < MEDIUM):
				print 1
			elif (val[1] < SHORT and val_next[1] > LONG and val_next[1] < LONGEST):
				print "A"
			elif (val[1] < SHORT and val_next[1] > LONGEST):
				print "B"
			elif (val[1] > MEDIUM and val_next[1] > MEDIUM):
				print "C"
	print "-----------End-----------\n"

	print "Size of array is " + str(len(command))