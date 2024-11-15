#!/bin/sh

# Replace environment variables in the built app
echo "window.env = {" > /usr/share/nginx/html/env-config.js
echo "  REACT_APP_API_URL: \"$REACT_APP_API_URL\"," >> /usr/share/nginx/html/env-config.js
echo "  REACT_APP_VERSION: \"$REACT_APP_VERSION\"," >> /usr/share/nginx/html/env-config.js
echo "  NODE_ENV: \"$NODE_ENV\"" >> /usr/share/nginx/html/env-config.js
echo "}" >> /usr/share/nginx/html/env-config.js 