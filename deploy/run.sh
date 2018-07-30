#!/usr/bin/env bash

echo "<-------- node deploy mode -------->"
ansible-playbook ./ansible/node.yml -i ./hosts -s -u ubuntu --private-key /Users/seungwon/Desktop/keys/bestpost.pem