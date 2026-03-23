#!/bin/sh

echo "Initializing localstack S3"

awslocal s3api create-bucket --bucket tareas-todo-attachments
