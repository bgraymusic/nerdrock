#!/usr/bin/env python
import webapp2
import urlparse
import urllib
import time

class CacheEntry:
	def __init__(self, time, data):
		self.time = time
		self.data = data

class ProxyHandler(webapp2.RequestHandler):
	cacheDuration = 300
	cache = {}
	def get(self):
		cacheKey = self.request.path_qs
		query = self.request.path_qs.replace('/' + self.method(), '')
		url = self.baseUrl() + query
		if (cacheKey in self.cache and (time.time() - self.cache[cacheKey].time) < self.cacheDuration):
			print 'Serving ' + self.method() + ' data from cache'
			self.response.write(self.cache[cacheKey].data)
		else:
			print 'Fetching new ' + self.method() + ' data from ' + url
			f = urllib.urlopen(url)
			data = self.successFilter(f.read())
			self.response.write(data)
			self.cache[cacheKey] = CacheEntry(time.time(), data);
	def post(self): self.get()
	def successFilter(self, data): return data
	def errorFilter(self, data): return data

class WordpressHandler(ProxyHandler):
	def method(self):
		return 'blog';
	def baseUrl(self):
		return 'https://briangraymusic.wordpress.com';
	def successFilter(self, html):
		html = html.replace('</head>', '<link rel="stylesheet" href="/css/bg.css"></link></head>')
		html = html.replace('https://briangraymusic.wordpress.com', '/blog')
		html = html.replace('https:\/\/briangraymusic.wordpress.com\/', '/blog')
		return html

class BandcampHandler(ProxyHandler):
	def method(self):
		return 'bc';
	def baseUrl(self):
		return 'http://briangray.bandcamp.com';
	def successFilter(self, html):
		html = html.replace('</head>', '<link rel="stylesheet" href="/css/bg.css"></link></head>')
		html = html.replace('http://briangray.bandcamp.com', '/bc')
		html = html.replace('http:\/\/briangray.bandcamp.com\/', '/bc')
		html = html.replace('href="/', 'href="/bc/')
		return html

class BandcampAPIHandler(ProxyHandler):
	def method(self):
		return 'bcapi';
	def baseUrl(self):
		return 'http://api.bandcamp.com';
	def errorFilter(self, json):
		json = json.replace('"discography":', '"netError":true,"discography":')
		return json

wordpress = webapp2.WSGIApplication([('/blog.*', WordpressHandler)], debug=True)
bandcampAPI = webapp2.WSGIApplication([('/bcapi.*', BandcampAPIHandler)], debug=True)
bandcamp = webapp2.WSGIApplication([('/bc.*', BandcampHandler)], debug=True)
