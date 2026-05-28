#!/usr/bin/env fish
# Deploy del backend: sube el código y actualiza el deployment público.
# Uso: ./deploy.fish "mensaje del cambio"

set DEPID AKfycby1-bZ0plQbpW6gTfgT0mdrYmf__zGfHNvQVMGhnZcT8iJ79MhUOBtrqNR6AxxkEZnC
set MSG (test -n "$argv[1]"; and echo $argv[1]; or echo "deploy")

clasp push
and clasp create-deployment --deploymentId $DEPID -d $MSG
