#gcloud auth configure-docker gcr.io
docker build --platform=linux/amd64 . -t gcr.io/project/name
docker push gcr.io/project/name