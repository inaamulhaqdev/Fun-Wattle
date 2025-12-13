# Backend

This backend is written in Python, and managed with Django.

In order to access the database on [supabase](https://supabase.com/), Django uses Object Relational Mapping (ORM) to link Python objects to supabase elements.

The backend has been deployed on [render](https://render.com/) at the following URL: `https://funwattle-backend-g1xh.onrender.com`, which is used to host the API for the frontend application.

A quick note on render: When you've created a new GitHub repoository from our zipped project, you will need to update the render deployment to point to your new repository. You can do this by going to the render dashboard, selecting the Funwattle backend service, and clicking on "Settings". From there, you can change the GitHub repository to your new repository. This means that any new changes pushed to your new repository will be automatically deployed to render, which is currently linked to our UNSW COMP3900 project repository

# File Walkthrough

Below is an explaination of all the important files in the directory:

- [requirements.txt](./requirements.txt)
  This contains all python libraries that are to be installed, and used during runtime.
- [Dockerfile](./Dockerfile)
  Where the backend Dockerfile is setup, and the run environment is created.
- [controller/models.py](./controller/models.py)
  Where the models that are used in ORM are stored (models directly correspond to tables in Supabase). In order to update them in the database, you must use a Django migration (read more [here](https://docs.djangoproject.com/en/5.2/topics/migrations/)) - Do NOT modify the schema from Supabase directly, use django migrations instead.
- [controller/serializers.py](./controller/serializers.py)
  Where the models are turned into JSON objects, so that they can be used by the API calls.
- [controller/views](./controller/views/)
  This is where the API logic occurs, and majority of the code functionality for the backend is.
- [controller/urls.py](./controller/urls.py)
  Where the views are set to a specific endpoint, so that they can be called in the API.
- [controller/test](./controller/test/)
  The test files location. See more in the [README.md](./controller/test/README.md)
- [controller/views/azureAIViews](./controller/views/azureAIViews)
  assess_speech handles speech assessment end-to-end: converting audio, running Azure STT + pronouciation scoring, embedding the transcript, checking semantic correctness via pgvector, and generating GPT feedback.
  text_to_speech converts texts into Azure speech using SSML and returns an MP3 audio response
- [controller/backend/ai-pipline](./controller/backend/ai-pipline)
  This folder contains Python scripts that load all questions, expected answers and RAG resources, convert them into embeddings using Azure OpenAI, and upload those vectors into Supabase(pgvector) for retrieval during speeech assessment.
