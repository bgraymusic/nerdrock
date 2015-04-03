#!/usr/bin/env python
import webapp2
import urllib

class ProxyHandler(webapp2.RequestHandler):
	def get(self):
		url = self.request.params.get('url')
		f = urllib.urlopen(url)
		data = f.read()
#		self.response.write(data)
		for key in f.info():
			self.response.write(key + ': ' + f.info()[key] + '\r\n')
	def post(self):
		return self.get()

proxy = webapp2.WSGIApplication([('/proxy.*', ProxyHandler)], debug=True)
