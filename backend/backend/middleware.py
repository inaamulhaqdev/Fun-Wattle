import logging
import time

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware:
    """
    Middleware to log all incoming HTTP requests and their responses.
    Logs request method, path, status code, and response time.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log the incoming request
        start_time = time.time()
        
        # Get request details
        method = request.method
        path = request.get_full_path()
        
        # Process the request
        response = self.get_response(request)
        
        # Calculate response time
        duration = time.time() - start_time
        duration_ms = int(duration * 1000)
        
        # Log the response
        status_code = response.status_code
        log_message = f"{method} {path} {status_code} {duration_ms}ms"
        
        # Log as error for 5xx, warning for 4xx, info otherwise
        if status_code >= 500:
            logger.error(log_message)
        elif status_code >= 400:
            logger.warning(log_message)
        else:
            logger.info(log_message)
        
        return response
