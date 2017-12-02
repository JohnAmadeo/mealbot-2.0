#! python3

# ------------- YSC MEAL BOT -------------
# This script randomly (or *mostly* randomly) groups students to get a meal together and
# sends an email to each group to inform them. As the user of this script, you have a
# solemn responsibility; misusing this script could send out a great many erroneous and unwanted
# emails. With great power comes great responsibility.
#
# USAGE:
# --YSCList.txt:
#   Create a tab-delimited csv file of students. Each student must have Name and Email. Additional
#   columns are OK, too.
# --Message.txt:
#   Create a file with the body of the email you want sent out to each pair. The string
#   "{GroupList}" should appear once in this file; it will be replaced with the list of
#   names in the pair.
#
# -- In the simplest case, run YSCLunch without arguments. It'll randomly pair people from YSCList.txt,
#    print the pairings, and then ask if you want to send the email to them all.
#
# -- You can also choose to avoid pairing people with the same value in some specific column (e.g., don't)
#    pair people from the same college). In that case, you'd use the -mc (or --mix_column) argument to
#    indicate which column (e.g., "YSCLunch.py -mc College")
#
# Possible troubleshooting issues:
# -- Does your student list file contain a column for name titled "Name"?
# -- Does your student list file contain a column for email address titled "Email"?
# -- Is the meal bot GMail account configured to allow less secure apps to login?

import random
import math
import argparse
import smtplib
import csv

# Defaults - can be overridden with arguments.
DEFAULT_STUDENT_FILE      = "YSCList.txt"
DEFAULT_BOT_EMAIL_ADDRESS = "ysc.meal.bot@gmail.com"
DEFAULT_BOT_PASSWORD      = "the-meal-bot-password" # Saving passwords in plaintext is the 8th deadly sin. Do as I say, not as I do.
DEFAULT_SMTP_SERVER       = "smtp.gmail.com"
DEFAULT_SMTP_PORT         = 587
DEFAULT_SUBJECT           = "YSC Meals - This week's meal group!"
DEFAULT_MESSAGE_FILE      = "Message.txt"
DEFAULT_MIX_COLUMN        = ""

STUDFILE_DELIMITER        = '\t'

# Class that holds all the info about a student
class Student:
	def __init__(self, d):
		try:
			self.name = d["Name"]
			self.email = d["Email"]
		except KeyError as err:
			print("Your student list file must have columns titled 'Name' and 'Email'")
			print(d)
			raise
		self.fields = d
		self.paired = False
	
	def __getitem__(self, key):
		return self.fields[key]

def formStudList(student_file):
	# Initialize list to hold students
	studList = []
	
	with open(student_file, newline='') as csvfile:
		reader = csv.DictReader(csvfile, delimiter=STUDFILE_DELIMITER)
		for row in reader:
			studList.append(Student(row))
	
	# Randomize the list
	random.shuffle(studList)
	
	return studList

# Breaks the list l into chunks of size n. Remainders are distributed to other chunks.
# Returns a list of lists.
# EX. l = [0, 1, 2, 3]; n = 2. Returns [[0, 1], [2, 3]]
def chunk(l, n):
	# First break into chunks. Groups is a list of list of Students
	n = max(1, n)
	groups = [l[i:i + n] for i in range(0, len(l), n)]
	
	# Now if there are any singletons (they'll be at the end of the list), add them to other groups
	while len(groups[-1]) == 1:
		groups[-2].append(groups[-1].pop())
		groups.pop()
	
	return groups

# Pairs students from studList together. If mixCol is specified, then minimizes the number
# of students paired with the same value in the column mixCol.
# Returns a list of lists of Students, each sublist representing the pairs.
def pairStudents(studList, mixCol):
	# Without a column specified, we're just chunking the studList into sublists of length 2
	if not mixCol:
		return chunk(studList, 2)
	
	# check mixCol validity
	if mixCol not in studList[0].fields:
		raise ValueError("--mix_column must be a column in the student_file")
	
	# init the list of pairs...
	pairs = []
	
	for stud in studList:
		# this student may have already been paired with an earlier student in the list
		if stud.paired:
			continue
		
		remaining = [s for s in studList if not s.paired and s is not stud]
		if not remaining:
			# stud is the last student not yet paired
			pairs[0].append(stud)
			stud.paired = True
			break
		
		# remaining is a non-empty list of students yet to be paired.
		# Loop over it and match stud with the first one he's allowed to pair with
		for r in remaining:
			if stud[mixCol] != r[mixCol]:
				# It's a pair!
				pairs.append([stud, r])
				stud.paired = True
				r.paired = True
				break
		else:
			# All remaining students have the same value in mixCol as stud does.
			# Make a pair anyway.
			pairs.append([stud, remaining[0]])
			stud.paired = True
			remaining[0].paired = True
	
	return pairs


# Sends a single email thru already established session.
# Before sending, replaces the string "{GroupList}" in the rawBody with a list of
# recipients of the email, delimited by line breaks.
def sendSingleMail(session, sender, subject, recipients, rawBody):
	recNames = [stud.name for stud in recipients]
	recEmails = [stud.email for stud in recipients]

	headers = "\r\n".join(["from: " + sender,
						   "subject: " + subject,
						   "to: " + ", ".join(recEmails),
						   "mime-version: 1.0",
						   "content-type: text"])
	body = rawBody.replace("{GroupList}", "\n".join(recNames))
	content = headers + "\r\n\r\n" + body
	session.sendmail(sender, recEmails, content)


def sendEmails(groups, sender, password, server, port, subject, message_file):
	f = open(message_file, "r")
	rawBody = f.read()
	f.close()
	
	session = smtplib.SMTP(server, port)
	session.ehlo()
	session.starttls()
	session.login(sender, password)
	
	for grp in groups:
		sendSingleMail(session, sender, subject, grp, rawBody)
	session.close()

def main(sender, password, server, port, message_file, student_file, mix_column):
	# Get a random list of Students
	studList = formStudList(student_file)
	
	if len(studList) == 1:
		print("You only have 1 student, silly.")
		return
	
	# Divide into groups
	groups = pairStudents(studList, mix_column)
	
	# Print the groups
	for grp in groups:
		for stud in grp:
			print(stud.name, stud.email, sep="\t")
		print()
	
	# Send email?
	if input("Send email? (Y/n) =>") == "Y":
		print("Default subject line for email: ", DEFAULT_SUBJECT)
		subject = input("Enter subject line for email (enter blank for default) =>")
		if not subject:
			print("Using default subject line...")
			subject = DEFAULT_SUBJECT
			
		print("Sending emails...")
		sendEmails(groups, sender, password, server, port, subject, message_file)
		print("Emails away!")
	else:
		print("Not sending emails.")

parser = argparse.ArgumentParser()
parser.add_argument("-sf", "--student_file", help="file containing the list of students to group", action="store", default=DEFAULT_STUDENT_FILE)
parser.add_argument("-e", "--email", help="email address from which to send emails (defaults to Meal Bot)", action="store", default=DEFAULT_BOT_EMAIL_ADDRESS)
parser.add_argument("-p", "--password", help="password for the email account from which to send (defaults to Meal Bot password)", action="store", default=DEFAULT_BOT_PASSWORD)
parser.add_argument("-m", "--smtp", help="smtp server from which to send email (defaults to gmail)", action="store", default=DEFAULT_SMTP_SERVER)
parser.add_argument("-o", "--port", help="port of the smtp server (defaults to 587)", action="store", default=DEFAULT_SMTP_PORT)
parser.add_argument("-mf", "--message_file", help="file containing the email body ({GroupList} in the file will be replaced with the list of people in the group)", action="store", default=DEFAULT_MESSAGE_FILE)
parser.add_argument("-mc", "--mix_column", help="column name in student_file to mix in pairings. Avoid pairing students with same value in mix_column.", action="store", default=DEFAULT_MIX_COLUMN)
args = parser.parse_args()
main(args.email, args.password, args.smtp, args.port, args.message_file, args.student_file, args.mix_column)
