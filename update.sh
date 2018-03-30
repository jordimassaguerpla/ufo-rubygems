#!/bin/bash

[ -d ruby-advisory-db ] || git submodule update --init
cd ruby-advisory-db
git pull
cd ..
ruby get_stats_csv.rb > web/stats.csv


