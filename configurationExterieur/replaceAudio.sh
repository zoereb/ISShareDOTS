#!/bin/bash

SOURCE_DIR="./stepSequencer"
TARGET_DIR="~/stepSequencer"

for i in {1..8}; do
    TARGET_HOST="pi@dotpi-b-00$i.local"

    rsync --rsync-path='mkdir -p ~/stepSequencer && rsync' \
          --inplace --archive \
          --exclude='node_modules/' --exclude='.git/' \
          --delete \
          --progress \
          "$SOURCE_DIR/" \
          "$TARGET_HOST:$TARGET_DIR/"
          
    scp -r "./audio/40_buffer/HP_$i/audio_synth" "pi@dotpi-b-00$i.local:~/stepSequencer/src/clients/audio" 

    if [ $? -eq 0 ]; then
        echo "Synchronisation terminée avec succès pour $TARGET_HOST."
    else
        echo "Erreur lors de la synchronisation pour $TARGET_HOST."
    fi
done

echo "Toutes les synchronisations sont terminées."
