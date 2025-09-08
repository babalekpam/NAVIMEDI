# WSGI application for Passenger (if Python is required)
# This file redirects to the Node.js application

import os
import subprocess
import sys

def application(environ, start_response):
    # Start the Node.js application
    try:
        # Change to application directory
        os.chdir('/var/www/vhosts/navimedi.org/httpdocs')
        
        # Start the Node.js application
        process = subprocess.Popen(['node', 'app.js'], 
                                 stdout=subprocess.PIPE, 
                                 stderr=subprocess.PIPE)
        
        status = '200 OK'
        headers = [('Content-Type', 'text/plain')]
        start_response(status, headers)
        
        return [b'NaviMED Healthcare Platform is starting...']
        
    except Exception as e:
        status = '500 Internal Server Error'
        headers = [('Content-Type', 'text/plain')]
        start_response(status, headers)
        
        return [f'Error starting application: {str(e)}'.encode()]